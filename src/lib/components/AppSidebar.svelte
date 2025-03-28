<!-- /src/lib/components/app-sidebar.svelte -->
<script lang="ts">
    import {onMount} from 'svelte';
    import * as Sidebar from "$lib/components/ui/sidebar/index.js";
    import {Separator} from "$lib/components/ui/separator";
    import {Button} from "$lib/components/ui/button";

    import {Github} from "lucide-svelte";
    import {page} from '$app/state'
    import {commonItems} from "$lib/utils/bar";
    import YiCai from "$lib/components/YiCai.svelte";
    import TargetColorButton from "$lib/components/TargetColorButton.svelte";
    import LoadingSpinner from "$lib/components/LoadingSpinner.svelte";
    import { t } from '$lib/translations';

    interface PuzzleItem {
        id: number;
    }


    let puzzles: PuzzleItem[] = $state([]);
    let loadingSidebar = $state(false);

    async function loadPuzzles() {
        loadingSidebar = true;
        try {
            const response = await fetch('/puzzles_json/list.json');
            if (!response.ok) throw new Error($t('common.load_fail', {error: '无法加载题目列表'}));
            puzzles = await response.json();
            const detailedPuzzles = await Promise.all(
                puzzles.map(async (puzzle) => {
                    try {
                        const detailResponse = await fetch(`/puzzles_json/${puzzle.id}.json`);
                        if (detailResponse.ok) {
                            const details = await detailResponse.json();
                            return {...puzzle, ...details};
                        }
                        return puzzle;
                    } catch (e) {
                        return puzzle;
                    }
                })
            );
            puzzles = detailedPuzzles;
        } catch (error) {
            console.error('加载题目列表失败:', error);
        } finally {
            loadingSidebar = false;
        }
    }

    onMount(loadPuzzles);

    function isPathActive(urlStr: string) {
        return decodeURIComponent(page.url.pathname) === urlStr;
    }

    const sidebar = Sidebar.useSidebar();

    function handleClick() {
        if (sidebar.isMobile) {
            sidebar.setOpenMobile(false);
        }
    }
</script>

<Sidebar.Root class="border-r" collapsible="offcanvas" side="left" variant="sidebar">
    <Sidebar.Header class="px-4 py-2">
        <div class="flex items-center gap-2 mt-6">
            <a class="flex items-center space-x-2" href="/">
                <YiCai height="5" width="5"/>
                <span class="font-semibold text-xl sm:inline-block">{$t('common.title')}</span>
            </a>
        </div>
        <Sidebar.Menu>
            {#each commonItems as item(item.title)}
                <Sidebar.MenuItem>
                    <Sidebar.MenuButton isActive={isPathActive(item.url)}>
                        {#snippet child({props})}
                        <a
                                href={item.url}
                                {...props}
                                on:click={handleClick}
                        >
                            <item.icon class="h-4 w-4"/>
                            <span>{$t(item.title)}</span>
                        </a>
                        {/snippet}
                    </Sidebar.MenuButton>
                </Sidebar.MenuItem>
            {/each}
        </Sidebar.Menu>
    </Sidebar.Header>
    <Separator class="my-4"/>
    <Sidebar.GroupLabel class="px-3 text-sm font-semibold">
        {$t('common.puzzle_list')}
    </Sidebar.GroupLabel>
    <Sidebar.Content class="p-1">
        <Sidebar.Group>
            <Sidebar.GroupContent>
                <Sidebar.Menu>
                    {#if loadingSidebar}
                        <LoadingSpinner text={$t('common.load_list')}/>
                    {:else}
                        {#each puzzles as puzzle (puzzle.id)}
                            <Sidebar.MenuItem>
                                <Sidebar.MenuButton isActive={isPathActive(`/puzzles/${puzzle.id}`)}>
                                    {#snippet child({props})}
                                    <a
                                            href={`/puzzles/${puzzle.id}`}
                                            {...props}
                                            on:click={handleClick}
                                    >
                                        <TargetColorButton
                                                index={puzzle.targetColor}
                                                width={5}
                                                height={5}
                                        ></TargetColorButton>
                                        <span>{puzzle.title}</span>
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

    <Sidebar.Footer class="border-t p-4">
        <Button
                class="w-full justify-start gap-2"
                href="https://github.com/gantrol/yicai_wuthering_waves/issues"
                target="_blank"
                variant="outline"
        >
            <Github class="h-4 w-4"/>
            <span>{$t('common.issue_report')}</span>
        </Button>
    </Sidebar.Footer>
</Sidebar.Root>
