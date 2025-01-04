<!-- src/lib/components/Nav.svelte -->
<script>
    import { Button } from './ui/button'
</script>

<nav class="border-b bg-white dark:bg-slate-900">
    <div class="container mx-auto flex items-center justify-between px-4 py-3">
        <div class="flex items-center gap-2">
            <!-- 项目标题或 Logo -->
            <span class="text-xl font-bold">溢彩画 | 鸣潮 | 解题工具</span>
        </div>
        <div class="flex items-center gap-2">
            <!-- 这里可以放一些按钮、菜单之类 -->
            <Button variant="default" target="_blank" href="https://github.com/gantrol/yicai_wuthering_waves">
                开源仓库
            </Button>
        </div>
    </div>
</nav>
