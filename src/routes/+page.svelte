<!-- src/routes/+page.svelte -->
<script lang="ts">
    import { Button } from '$lib/components/ui/button';
    import { ArrowRight, Palette, Gamepad2, BookOpen, ArrowDown } from 'lucide-svelte';
    import { goto } from '$app/navigation';
    import Demo from "$lib/components/game/Demo.svelte";

    function scrollTomore() {
        const demoSection = document.querySelector('#more');
        demoSection?.scrollIntoView({ behavior: 'smooth' });
    }
</script>

<div class="min-h-screen from-background to-secondary/20">
    <section class="pt-32 px-4 text-center relative overflow-hidden">
        <div class="absolute inset-0 opacity-10">
            <div class="absolute top-10 left-10 w-32 h-32 bg-primary/30 rounded-full blur-3xl animate-pulse"></div>
            <div class="absolute bottom-10 right-10 w-32 h-32 bg-secondary/30 rounded-full blur-3xl animate-pulse"></div>
            <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-accent/20 rounded-full blur-3xl"></div>
        </div>

        <div class="relative z-10 max-w-4xl mx-auto">
            <h1 class="text-5xl md:text-6xl font-bold mb-16 tracking-tight">
                <span class="bg-gradient-to-r from-[#FF6B6B] via-[#4ECDC4] to-[#45B7D1] bg-clip-text text-transparent animate-fade-in drop-shadow-sm">
                    溢彩画
                </span>
            </h1>

            <div class="flex justify-center gap-6 mb-4 animate-slide-up-delayed">
                <Button
                        size="lg"
                        variant="default"
                        class="group transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
                        onclick={() => goto('/random')}
                >
                    开始游戏
                    <ArrowRight class="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
                </Button>
                <Button
                        size="lg"
                        variant="outline"
                        class="group transition-all duration-300 hover:scale-105 shadow-md hover:shadow-lg"
                        onclick={scrollTomore}
                >
                    查看更多
                    <ArrowDown class="ml-2 h-5 w-5 group-hover:translate-y-1 transition-transform duration-300" />
                </Button>
            </div>
        </div>
    </section>


    <section id="how-to-play" class="px-4 bg-secondary/10 backdrop-blur-sm">
        <Demo></Demo>
    </section>

    <section id="more" class="py-16 px-4 text-center relative overflow-hidden">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {#each [
                { icon: Gamepad2, title: '策略性', desc: '运用智慧解决每一个谜题', path: '/random' },
                { icon: Palette, title: '自定义', desc: '创造属于你的独特谜题', path: '/edit' },
                { icon: BookOpen, title: '题库', desc: '丰富的题库与自动解答', path: '/puzzles' }
            ] as { icon, title, desc, path }}
                <div
                        class="bg-background/50 backdrop-blur-sm p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 cursor-pointer border border-border/50"
                        on:click={() => goto(path)}
                >
                    <div class="text-4xl mb-6 text-primary/80">
                        <svelte:component this={icon} class="mx-auto" />
                    </div>
                    <h3 class="font-bold text-xl mb-3">{title}</h3>
                    <p class="text-muted-foreground">{desc}</p>
                </div>
            {/each}
        </div>
    </section>
</div>

<style>
    .animate-fade-in {
        animation: fadeIn 1s ease-out;
    }

    .animate-slide-up {
        animation: slideUp 0.8s ease-out;
    }

    .animate-slide-up-delayed {
        animation: slideUp 0.8s ease-out 0.2s both;
    }

    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }

    @keyframes slideUp {
        from {
            opacity: 0;
            transform: translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
</style>
