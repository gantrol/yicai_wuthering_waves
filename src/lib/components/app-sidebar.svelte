<!-- /src/lib/components/app-sidebar.svelte -->
<script lang="ts">
    import { onMount } from 'svelte';
    import * as Sidebar from "$lib/components/ui/sidebar/index.js";
    import { Separator } from "$lib/components/ui/separator";
    import { Button } from "$lib/components/ui/button";

    import House from "lucide-svelte/icons/house";
    import Inbox from "lucide-svelte/icons/inbox";
    import Github from "lucide-svelte/icons/github";
    import PuzzleIcon from "lucide-svelte/icons/puzzle";
    import ChevronRight from "lucide-svelte/icons/chevron-right";

    interface PuzzleItem {
        id: number;
    }

    const commonItems = [
        { title: "首页", url: "/", icon: House },
        { title: "题库", url: "/puzzles", icon: Inbox },
        // { title: "其它示例", url: "#random", icon: Circle },
    ];

    let puzzles: PuzzleItem[] = [];

    async function loadPuzzles() {
        try {
            const response = await fetch('/puzzles_json/list.json');
            if (!response.ok) throw new Error('无法加载题目列表');
            puzzles = await response.json();
            isLoading = false;
        } catch (error) {
            console.error('加载题目列表失败:', error);
            isLoading = false;
        }
    }

    onMount(async () => {
        await loadPuzzles();
    });
</script>

<Sidebar.Root side="left" variant="sidebar" collapsible="offcanvas" class="border-r">
    <Sidebar.Header class="px-4 py-3">
        <div class="flex items-center gap-2">
            <PuzzleIcon class="h-6 w-6" />
            <span class="font-semibold text-xl">溢彩画工具</span>
        </div>
    </Sidebar.Header>

        <Sidebar.Content class="p-2">
            <Sidebar.Group>
                <Sidebar.GroupContent>
                    <Sidebar.Menu>
                        {#each commonItems as item (item.title)}
                            <Sidebar.MenuItem>
                                <Sidebar.MenuButton>
                                    {#snippet child({ props })}
                                    <a href={item.url} {...props}
                                       class="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-accent">
                                        <item.icon class="h-4 w-4" />
                                        <span>{item.title}</span>
                                    </a>
                                    {/snippet}
                                </Sidebar.MenuButton>
                            </Sidebar.MenuItem>
                        {/each}
                    </Sidebar.Menu>
                </Sidebar.GroupContent>
            </Sidebar.Group>

            <Separator class="my-4" />

            <Sidebar.Group>
                <Sidebar.GroupLabel class="px-3 text-sm font-semibold">
                    题目列表
                </Sidebar.GroupLabel>
                <Sidebar.GroupContent>
                    <Sidebar.Menu>
                        {#each puzzles as puzzle (puzzle.id)}
                            <Sidebar.MenuItem>
                                <Sidebar.MenuButton>
                                    {#snippet child({ props })}
                                    <a
                                            href={`/puzzles/${puzzle.id}`}
                                           {...props}
                                           class="flex items-center justify-between rounded-lg px-3 py-2 hover:bg-accent">
                                        <div class="flex items-center gap-3">
                                            <PuzzleIcon class="h-4 w-4" />
                                            <span>题目 {puzzle.id}</span>
                                        </div>
<!--                                        <ChevronRight class="h-4 w-4" />-->
                                    </a>
                                    {/snippet}
                                </Sidebar.MenuButton>
                            </Sidebar.MenuItem>
                        {/each}
                    </Sidebar.Menu>
                </Sidebar.GroupContent>
            </Sidebar.Group>
        </Sidebar.Content>

    <Sidebar.Footer class="border-t p-4">
        <Button
                variant="outline"
                class="w-full justify-start gap-2"
                href="https://github.com/gantrol/yicai_wuthering_waves"
                target="_blank"
        >
            <Github class="h-4 w-4" />
            <span>GitHub 仓库</span>
        </Button>
    </Sidebar.Footer>
</Sidebar.Root>
