<!-- src/lib/components/Nav.svelte -->
<script lang="ts">
    import { Button } from "$lib/components/ui/button";
    import { Separator } from './ui/separator';
    import Github from 'lucide-svelte/icons/github';
    import HelpCircle from 'lucide-svelte/icons/help-circle';
    import Settings from 'lucide-svelte/icons/settings';
    import * as Sheet from '$lib/components/ui/sheet';
    import { Tooltip } from './ui/tooltip';
    import {commonItems} from "$lib/utils/bar";
    import YiCai from "$lib/components/YiCai.svelte";
    import {t} from "$lib/translations";
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
                <YiCai width="4" height="4" />
                <span class="hidden font-bold sm:inline-block">
                    {$t('common.navTitle')}
                </span>
            </a>
            <Separator orientation="vertical" class="h-6" />
            <div class="flex gap-6">
                {#each commonItems as item(item.title)}
                    <a href={item.url} class="flex items-center text-sm font-medium">
                        {item.title}
                    </a>
                {/each}
            </div>
        </div>

        <!-- Right side buttons -->
        <div class="ml-auto flex items-center gap-2">

            <Tooltip>
                <Button variant="ghost" size="icon" href="https://github.com/gantrol/yicai_wuthering_waves" target="_blank">
                    <Github class="h-5 w-5" />
                    <span class="sr-only">GitHub</span>
                </Button>
            </Tooltip>
        </div>
    </div>
</nav>
