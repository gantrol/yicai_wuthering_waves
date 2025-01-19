<script lang="ts">
    import { page } from "$app/state";
    import { Button } from "$lib/components/ui/button";
    import { Separator } from "./ui/separator";
    import Github from "lucide-svelte/icons/github";
    import HelpCircle from "lucide-svelte/icons/help-circle";
    import Settings from "lucide-svelte/icons/settings";
    import * as Sheet from "$lib/components/ui/sheet";
    import { Tooltip } from "./ui/tooltip";
    import { commonItems } from "$lib/utils/bar";
    import YiCai from "$lib/components/YiCai.svelte";
    import { t, locales, locale, setLocale } from "$lib/translations";
    import * as DropdownMenu from "$lib/components/ui/dropdown-menu";
    import Languages from "lucide-svelte/icons/languages";
    interface Props {
        children?: import("svelte").Snippet;
    }

    let { children }: Props = $props();
    let currentLocale = $state($locale);

    const languageNames = {
        en: "English",
        "zh-CN": "简体中文",
        "zh-TW": "繁體中文",
        ja: "日本語",
        ko: "한국어",
        fr: "Français",
        de: "Deutsch",
        es: "Español",
    };

    // Generate the language list from the languageNames object
    let languageList = Object.keys(languageNames).map((code) => ({
        code,
        name: languageNames[code],
    }));

    function handleLocaleChange(newLocale: string) {
        currentLocale = newLocale;

        // Set the new locale in the cookie for server-side language detection
        document.cookie = `lang=${newLocale}; path=/; SameSite=Lax`;

        // Set the locale for the current session
        setLocale(newLocale);
    }
</script>

<nav class="border-b bg-white dark:bg-slate-900 sticky top-0 z-50">
    <div class="container mx-auto flex h-16 items-center px-4">
        {@render children?.()}

        <!-- Logo and Title -->
        <div class="flex items-center gap-6 md:gap-8">
            <a href="/" class="flex items-center space-x-2">
                <YiCai width="4" height="4" />
                <span class="hidden font-bold sm:inline-block">
                    {$t("common.navTitle")}
                </span>
            </a>
            <Separator orientation="vertical" class="h-6" />
            <div class="flex gap-6">
                {#each commonItems as item (item.title)}
                    <a
                        href={item.url}
                        class="flex items-center text-sm font-medium"
                    >
                        {item.title}
                    </a>
                {/each}
            </div>
        </div>

        <!-- Right side buttons -->
        <div class="ml-auto flex items-center gap-2">
            <div class="ml-auto flex items-center gap-2">
                <DropdownMenu.Root>
                    <DropdownMenu.Trigger>
                        <Button variant="ghost" size="icon">
                            <Languages class="h-5 w-5" />
                            <span class="sr-only">Language</span>
                        </Button>
                    </DropdownMenu.Trigger>
                    <DropdownMenu.Content
                        align="end"
                        class="w-40 p-1 bg-white dark:bg-slate-800 shadow-lg rounded-md"
                    >
                        {#each languageList as lang (lang.code)}
                            <DropdownMenu.Item
                                onclick={() => handleLocaleChange(lang.code)}
                                class="flex items-center justify-between p-2 text-sm hover:bg-gray-100 dark:hover:bg-slate-700 rounded-md cursor-pointer transition-all"
                            >
                                <span
                                    class:font-medium={currentLocale ===
                                        lang.code}
                                >
                                    {lang.name}
                                </span>
                                {#if currentLocale === lang.code}
                                    <span class="text-primary">✓</span>
                                {/if}
                            </DropdownMenu.Item>
                        {/each}
                    </DropdownMenu.Content>
                </DropdownMenu.Root>
                <Tooltip>
                    <Button
                        variant="ghost"
                        size="icon"
                        href="https://github.com/gantrol/yicai_wuthering_waves"
                        target="_blank"
                    >
                        <Github class="h-5 w-5" />
                        <span class="sr-only">GitHub</span>
                    </Button>
                </Tooltip>
            </div>
        </div>
    </div>
</nav>
