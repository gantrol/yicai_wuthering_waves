<script>
    import "../app.css";
    import Nav from '$lib/components/Nav.svelte'
</script>

<!-- 视图部分 -->
<div class="min-h-screen flex flex-col bg-background text-foreground">
    <!-- 顶部导航 -->
    <Nav />

    <!-- 页面主体，留个插槽给下级路由页面 -->
    <main class="flex-1 container mx-auto p-4">
        <slot />
    </main>
</div>

<svelte:head>
    <title>溢彩画高手|鸣潮|解题工具</title>
    <meta name="description" content="溢彩画是一款鸣潮小游戏，这是它的编辑与解题工具，帮助玩家在目标步数内完成染色挑战。支持编辑模式和手工解题模式，助您轻松掌握游戏技巧。" />
    <meta name="keywords" content="溢彩画, 鸣潮小游戏, Svelte游戏, 游戏编辑器, 解题工具, 染色游戏" />

    <!-- Open Graph Meta Tags -->
    <meta property="og:title" content="溢彩画高手|鸣潮|解题工具" />
    <meta property="og:description" content="溢彩画是一款鸣潮小游戏，这是它的编辑与解题工具，帮助玩家在目标步数内完成染色挑战。支持编辑模式和手工解题模式，助您轻松掌握游戏技巧。" />
    <meta property="og:type" content="website" />
    <!--  <meta property="og:url" content="https://yourwebsite.com/溢彩画" />-->
    <!--  <meta property="og:image" content="https://yourwebsite.com/path-to-image.jpg" />-->

    <!-- Twitter Card Meta Tags -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="溢彩画高手|鸣潮|解题工具" />
    <meta name="twitter:description" content="溢彩画是一款有趣的小游戏编辑与解题工具，帮助玩家在目标步数内完成染色挑战。支持编辑模式和手工解题模式，助您轻松掌握游戏技巧。" />
    <!--  <meta name="twitter:image" content="https://yourwebsite.com/path-to-image.jpg" />-->
</svelte:head>
