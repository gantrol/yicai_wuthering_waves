<!-- src/lib/components/ui/toast/Toast.svelte -->
<script lang="ts">
    import { fly } from 'svelte/transition';
    import { toastStore } from '$lib/stores/toast';
    import { cn } from '$lib/utils';
    import CheckCircle from 'lucide-svelte/icons/check-circle';
    import AlertCircle from 'lucide-svelte/icons/alert-circle';
    import Info from 'lucide-svelte/icons/info';
    import AlertTriangle from 'lucide-svelte/icons/alert-triangle';
    import X from 'lucide-svelte/icons/x';

    const icons = {
        success: CheckCircle,
        error: AlertCircle,
        info: Info,
        warning: AlertTriangle
    };

    const colors = {
        success: 'bg-green-50 border-green-200 text-green-800',
        error: 'bg-red-50 border-red-200 text-red-800',
        info: 'bg-blue-50 border-blue-200 text-blue-800',
        warning: 'bg-yellow-50 border-yellow-200 text-yellow-800'
    };

    const iconColors = {
        success: 'text-green-500',
        error: 'text-red-500',
        info: 'text-blue-500',
        warning: 'text-yellow-500'
    };
</script>

<div class="fixed top-4 right-4 z-50 flex flex-col gap-2 w-[360px]">
    {#each $toastStore as toast (toast.id)}
        <div
                transition:fly={{ x: 50, duration: 300 }}
                class={cn(
        'relative rounded-lg border p-4 shadow-md',
        colors[toast.type]
      )}
        >
            <div class="flex items-start gap-3">
                <svelte:component
                        this={icons[toast.type]}
                        class={cn('h-5 w-5', iconColors[toast.type])}
                />
                <p class="text-sm flex-1">{toast.message}</p>
                <button
                        class="text-gray-400 hover:text-gray-600 transition-colors"
                        on:click={() => toastStore.removeToast(toast.id)}
                >
                    <X class="h-4 w-4" />
                </button>
            </div>

            {#if toast.duration}
                <div
                        class={cn(
            'absolute bottom-0 left-0 h-1 rounded-b-lg transition-all duration-300',
            iconColors[toast.type]
          )}
                        style="width: 100%; animation: shrink {toast.duration}ms linear forwards;"
                />
            {/if}
        </div>
    {/each}
</div>

<style>
    @keyframes shrink {
        from { width: 100%; }
        to { width: 0%; }
    }
</style>
