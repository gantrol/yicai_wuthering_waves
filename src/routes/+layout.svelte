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
