<!-- src/lib/components/Nav.svelte -->
<script lang="ts">
    import { Button } from "$lib/components/ui/button";
    import { Separator } from './ui/separator';
    import Github from 'lucide-svelte/icons/github';
    import HelpCircle from 'lucide-svelte/icons/help-circle';
    import Settings from 'lucide-svelte/icons/settings';
    import * as Sheet from '$lib/components/ui/sheet';
    import { Tooltip } from './ui/tooltip';
    interface Props {
        children?: import('svelte').Snippet;
    }

    let { children }: Props = $props();
</script>

<nav class="border-b bg-white dark:bg-slate-900 sticky top-0 z-50">
    <div class="container mx-auto flex h-16 items-center px-4">
        {@render children?.()}

        <!-- Logo and Title -->
        <div class="flex items-center gap-6 md:gap-8">
            <a href="/" class="flex items-center space-x-2">
                <span class="hidden font-bold sm:inline-block">
                    溢彩画|鸣潮|解题工具
                </span>
            </a>
            <Separator orientation="vertical" class="h-6" />
            <div class="flex gap-6">
                <a href="/" class="flex items-center text-sm font-medium">
                    首页
                </a>
                <a href="/puzzles" class="flex items-center text-sm font-medium">
                    题库
                </a>
            </div>
        </div>

        <!-- Right side buttons -->
        <div class="ml-auto flex items-center gap-2">
<!--            <Tooltip>-->
<!--                <Button variant="ghost" size="icon" class="hidden md:flex">-->
<!--                    <HelpCircle class="h-5 w-5" />-->
<!--                    <span class="sr-only">Help</span>-->
<!--                </Button>-->
<!--                <svelte:fragment slot="content">-->
<!--                    帮助文档-->
<!--                </svelte:fragment>-->
<!--            </Tooltip>-->

<!--            <Tooltip>-->
<!--                <Button variant="ghost" size="icon" class="hidden md:flex">-->
<!--                    <Settings class="h-5 w-5" />-->
<!--                    <span class="sr-only">Settings</span>-->
<!--                </Button>-->
<!--                <svelte:fragment slot="content">-->
<!--                    设置-->
<!--                </svelte:fragment>-->
<!--            </Tooltip>-->

            <Tooltip>
                <Button variant="ghost" size="icon" href="https://github.com/gantrol/yicai_wuthering_waves" target="_blank">
                    <Github class="h-5 w-5" />
                    <span class="sr-only">GitHub</span>
                </Button>
                {#snippet content()}
                        GitHub 仓库
                {/snippet}
            </Tooltip>

            <!-- Mobile menu trigger -->
            <Sheet.Root>
                <Sheet.Trigger class="md:hidden">
                    <Button variant="ghost" size="icon">
                        <Settings class="h-5 w-5" />
                        <span class="sr-only">Toggle menu</span>
                    </Button>
                </Sheet.Trigger>
                <Sheet.Content side="right" class="w-[300px]">
                    <Sheet.Header>
                        <Sheet.Title>菜单</Sheet.Title>
<!--                        <Sheet.Description>在这里快速访问常用功能。</Sheet.Description>-->
                    </Sheet.Header>
                    <div class="flex flex-col gap-4 py-4">
<!--                        <a href="/help" class="flex items-center gap-2 px-4 py-2 text-sm">-->
<!--                            <HelpCircle class="h-5 w-5" />-->
<!--                            帮助文档-->
<!--                        </a>-->
<!--                        <a href="/settings" class="flex items-center gap-2 px-4 py-2 text-sm">-->
<!--                            <Settings class="h-5 w-5" />-->
<!--                            设置-->
<!--                        </a>-->
                        <a
                                href="https://github.com/gantrol/yicai_wuthering_waves"
                                target="_blank"
                                class="flex items-center gap-2 px-4 py-2 text-sm"
                        >
                            <Github class="h-5 w-5" />
                            GitHub 仓库
                        </a>
                    </div>
                </Sheet.Content>
            </Sheet.Root>
        </div>
    </div>
</nav>
