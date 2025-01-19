<!-- src/routes/+page.svelte -->
<script lang="ts">
    import {Button} from '$lib/components/ui/button';
    import {ArrowDown, ArrowRight, BookOpen, Gamepad2, Palette} from 'lucide-svelte';
    import {goto} from '$app/navigation';
    import Demo from "$lib/components/game/Demo.svelte";
    import { t } from "$lib/translations";

    function scrollTomore() {
        const demoSection = document.querySelector('#more');
        demoSection?.scrollIntoView({behavior: 'smooth'});
    }

    // let titleList = $derived($t('home.title').split(' '));
</script>

<div class="min-h-screen from-background to-secondary/20">
    <section class="pt-32 px-4 text-center relative overflow-hidden">
        <div class="absolute inset-0 opacity-10">
            <div class="absolute top-10 left-10 w-32 h-32 bg-primary/30 rounded-full blur-3xl animate-pulse"></div>
            <div class="absolute bottom-10 right-10 w-32 h-32 bg-secondary/30 rounded-full blur-3xl animate-pulse"></div>
            <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-accent/20 rounded-full blur-3xl"></div>
        </div>

        <div class="relative z-10 max-w-4xl mx-auto">
            <h1 class="text-5xl md:text-7xl font-bold mb-16 tracking-tight flex justify-center items-center gap-2 md:gap-4">
                {#each '溢彩画' as word, i}
                    <span class="color-animate font-serif"
                          style="animation-delay: {i * 0.3}s; text-shadow: 2px 2px 4px rgba(0,0,0,0.1);">
                        {word}
                    </span>
                {/each}
            </h1>

            <div class="flex justify-center gap-6 mb-4 animate-slide-up-delayed">
                <Button
                        class="group transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
                        onclick={() => goto('/random')}
                        size="lg"
                        variant="default"
                >
                    {$t('common.start_game')}
                    <ArrowRight class="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300"/>
                </Button>
                <Button
                        class="group transition-all duration-300 hover:scale-105 shadow-md hover:shadow-lg"
                        onclick={scrollTomore}
                        size="lg"
                        variant="outline"
                >
                    {$t('common.see_more')}
                    <ArrowDown class="ml-2 h-5 w-5 group-hover:translate-y-1 transition-transform duration-300"/>
                </Button>
            </div>
        </div>
    </section>


    <section class="px-4 bg-secondary/10 backdrop-blur-sm" id="how-to-play">
        <Demo></Demo>
    </section>

    <section class="py-16 px-4 text-center relative overflow-hidden" id="more">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {#each [
                {icon: Gamepad2, title: $t('common.strategy'), desc: $t('common.strategy_desc'), path: '/random'},
                {icon: Palette, title: $t('common.customize'), desc: $t('common.customize_desc'), path: '/edit'},
                {icon: BookOpen, title: $t('common.library'), desc: $t('common.library_desc'), path: '/puzzles'}
            ] as {icon, title, desc, path}}
                <div
                        class="bg-background/50 backdrop-blur-sm p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 cursor-pointer border border-border/50"
                        on:click={() => goto(path)}
                >
                    <div class="text-4xl mb-6 text-primary/80">
                        <svelte:component this={icon} class="mx-auto"/>
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
        from {
            opacity: 0;
        }
        to {
            opacity: 1;
        }
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

    /*标题动画*/
    .color-animate {
        animation: colorChange 16s infinite;
    }

    .color-animate:hover {
        transform: scale(1.1);
    }

    @keyframes colorChange {
        0%, 20% {
            color: #4980b9;
        }
        25%, 45% {
            color: #d2463e;
        }
        50%, 70% {
            color: #f5db82;
        }
        75%, 95% {
            color: #59a68d;
        }
        100% {
            color: #4980b9; /* 回到蓝色 */
        }
    }
</style>
