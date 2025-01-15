<script lang="ts">
    let {text} = $props();
</script>

<div class="flex items-center justify-center py-20">
    <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
    {#if text}
        <span class="ml-3 text-slate-600">{text}</span>
    {/if}
</div>
