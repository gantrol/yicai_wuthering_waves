<!-- /src/routes/+layout.svelte -->
<script lang="ts">
    import "../app.css";
    import Nav from '$lib/components/Nav.svelte'
    import * as Sidebar from "$lib/components/ui/sidebar/index.js";
    import AppSidebar from '$lib/components/AppSidebar.svelte';
    import ToastContainer from "$lib/components/ToastContainer.svelte";

    // SvelteKit 会将下级页面的内容作为 children 或 <slot /> 呈现
    let { children } = $props();
</script>

<!-- 外层布局：顶部导航 + sidebar + 内容 -->
<div class="min-h-screen flex flex-col bg-background text-foreground">
    <!-- 顶部导航 -->

    <!-- 在此处使用 sidebar 提供器 -->
    <Sidebar.Provider collapsible="icon">
        <!-- Sidebar组件（左侧） -->
        <AppSidebar />

        <!-- 主体内容区域 -->
        <main class="flex-1 container mx-auto p-4">
            <Nav>
                <Sidebar.Trigger />
            </Nav>

            <!-- 可选的触发按钮，用于折叠/展开 sidebar -->
            {@render children?.()}
        </main>
    </Sidebar.Provider>
</div>

<ToastContainer/>

<svelte:head>
    <title>溢彩画解题工具|鸣潮</title>
    <meta name="description" content="溢彩画是一款鸣潮小游戏，这是它的编辑与解题工具，帮助玩家在目标步数内完成染色挑战。支持编辑模式和手工解题模式，助您轻松掌握游戏技巧。" />
    <meta name="keywords" content="溢彩画, 鸣潮小游戏, Svelte游戏, 游戏编辑器, 解题工具, 染色游戏" />

    <!-- Open Graph Meta Tags -->
    <meta property="og:title" content="溢彩画高手|鸣潮|解题工具" />
    <meta property="og:description" content="溢彩画是一款鸣潮小游戏，这是它的编辑与解题工具，帮助玩家在目标步数内完成染色挑战。支持编辑模式和手工解题模式，助您轻松掌握游戏技巧。" />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="https://yicai.gantrol.com/" />
    <meta property="og:image" content="https://yicai.gantrol.com/favicon.png" />

    <!-- Twitter Card Meta Tags -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="溢彩画高手|鸣潮|解题工具" />
    <meta name="twitter:description" content="溢彩画是一款有趣的小游戏编辑与解题工具，帮助玩家在目标步数内完成染色挑战。支持编辑模式和手工解题模式，助您轻松掌握游戏技巧。" />
    <meta name="twitter:image" content="https://yicai.gantrol.com/favicon.png" />
</svelte:head>
